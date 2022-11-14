import React from 'react'
import { BEM, UiButton } from '@nevermined-io/styles'
import { MetaMask } from '@nevermined-io/catalog-providers'
import { User } from '../../context'
import styles from './wallet.module.scss'
import Link from 'next/link'

const b = BEM('wallet', styles)

export function XuiWallet() {
  const { network, isLogged } = React.useContext(User)
  const { walletAddress, loginMetamask } = MetaMask.useWallet()

  return !(isLogged && walletAddress) ? (
    <UiButton onClick={loginMetamask}>Connect wallet</UiButton>
  ) : (
    <>
      <Link href={'/account'}>
        <div className={b('block', ['address'])}>
          <span className={b('logged')} />
          <span className={b('account')}>Account</span>
          <span className={b('separator')} />
          {`${walletAddress.substr(0, 6)}...${walletAddress.substr(-4)}`}
        </div>
      </Link>
      {network && <div className={b('block', ['network'])}>{network}</div>}
    </>
  )
}
