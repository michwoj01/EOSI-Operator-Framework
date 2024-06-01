import type {ReactElement} from 'react'
import React from 'react';
import {Navigate, useParams} from 'react-router-dom'
import {decodeGameToken, getGameToken} from '../../apis/apis'
import {isNumber, isTokenExpired} from '../../utils/utils'

const GameTokenProtectedRoute = ({
  children,
  roles,
}: {
  children: ReactElement
  roles: string[]
}) => {
  const params = useParams()

  const gameToken = getGameToken()
  if (!gameToken || isTokenExpired(gameToken)) {
    return <Navigate to='/' replace />
  }

  const decodedToken = decodeGameToken(gameToken)
  if (
    !params.gameId ||
    !isNumber(params.gameId) ||
    decodedToken.gameSessionId !== Number(params.gameId)
  ) {
    return <Navigate to='/' replace />
  }

  if (!roles.every((role) => decodedToken.roles.includes(role))) {
    return <Navigate to='/' replace />
  }

  return children
}

export default GameTokenProtectedRoute
