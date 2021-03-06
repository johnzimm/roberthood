import {Observable} from 'rx'
import {instrumentIdFromUrl} from '../../../helpers'

export default (model$) => {
  const orders$ = model$.filter(m => m.token !== undefined && m.orders === undefined)
    .take(1)
    .flatMap(({token}) => Observable.just({
      method: 'GET',
      eager: true,
      url: `/orders?token=${token}`,
      category: 'orders',
    }))

  const instruments$ = model$.filter(m => m.token !== undefined
      && m.orders !== undefined
      && m.orders.every(o => typeof o.instrument === 'string'))
    .take(1)
    .flatMap(m => m.orders.map(o => ({
      method: 'GET',
      eager: true,
      url: `/instruments/${instrumentIdFromUrl(o.instrument)}?token=${m.token}`,
      orderId: o.id,
      category: 'orderInstrument',
    })))

  return Observable.merge(orders$, instruments$)
}
