import { intersection } from 'lodash'
export default function ({ store, route, redirect }) {
  if (route && route.meta && route.meta[0] && route.meta[0].roles && route.meta[0].roles.length) {
    if (intersection(store.getters['getUserRoles'], route.meta[0].roles).length === 0) {
      redirect({
        path: '/errors/forbidden',
        meta: `This route is forbidden`
      })
    }
  }
}
