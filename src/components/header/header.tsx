import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { XuiWallet } from 'ui'
import { BEM, UiDivider, UiLayout, UiText } from '@nevermined-io/styles'
import Link from 'next/link'
import Image from 'next/image'

import styles from './header.module.scss'

const b = BEM('header', styles)

interface HeaderLinkProps {
  href: string
  children: React.ReactNode
  target?: string
}

export const UiHeaderLink: React.FC<HeaderLinkProps> = ({
  href,
  target,
  children
}: HeaderLinkProps) => {
  const router = useRouter()
  const active = router.pathname === href

  const renderContent = () => {
    return (
      <span>
        <UiText
          className={`pointer ${b('link', { active })}`}
          type="link-caps"
          variants={active ? [] : ['highlight']}
        >
          {children}
        </UiText>
      </span>
    )
  }
  return (
    <>
      {target ? (
        <a href={href} target={target}>
          {renderContent()}
        </a>
      ) : (
        <Link href={href}>{renderContent()}</Link>
      )}
    </>
  )
}

interface HeaderProps {
  logoHref?: string
  children: React.ReactNode
}

export function UiHeader({ logoHref, children }: HeaderProps) {
  return (
    <header className={b()}>
      <UiLayout align="center" className={b('content')}>
        <Link href={logoHref || '/'}>
          <span>
            <Image width="50" height="50" className={b('logo')} src="/assets/million-token-matic.png" />
          </span>
        </Link>

        <UiDivider flex />

        <UiLayout>{children}</UiLayout>

        <XuiWallet />
      </UiLayout>
    </header>
  )
}
