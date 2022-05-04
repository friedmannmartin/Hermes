import { getUserByToken } from '../db/users.js'

export default async (req, res, next) => {
  const myToken = req.cookies.token

  if (myToken) {
    res.locals.user = await getUserByToken(myToken)
  } else {
    res.locals.user = null
  }
  next()
}
