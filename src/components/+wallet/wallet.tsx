import React from 'react'
import { BEM, UiButton } from '@nevermined-io/styles'
import { useWallet, ConnectKit } from '@nevermined-io/catalog-providers'
import { User } from '../../context'
import styles from './wallet.module.scss'
import Link from 'next/link'

const b = BEM('wallet', styles)

export function XuiWallet() {
  const { network, isLogged } = React.useContext(User)
  const { walletAddress } = useWallet()

  return <ConnectKit.ConnectKitButton/>
}
