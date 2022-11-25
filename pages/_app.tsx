import '@nevermined-io/styles/lib/esm/styles/globals.scss'
import '@nevermined-io/styles/lib/esm/index.css'
import '../src/styles/styles.scss'
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { Catalog, AuthToken, AssetService } from '@nevermined-io/catalog-core'
import { WalletProvider, getClient, useWallet } from '@nevermined-io/catalog-providers'
import { Logger } from '@nevermined-io/nevermined-sdk-js'
import { ethers } from 'ethers'
import { UiHeader, UiHeaderLink, UiFooter } from 'ui'
import { UiDivider } from '@nevermined-io/styles'
import UserProvider from '../src/context/UserProvider'
import {
  marketplaceUri,
  neverminedNodeUri,
  neverminedNodeAddress,
  faucetUri,
  webProviderUri,
  secretStoreUri,
  verbose,
  graphUrl,
  artifactsFolder,
  correctNetworkId
} from 'src/config'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../src/components/toast/toast.scss'

const appConfig = {
  web3Provider:
    typeof window !== 'undefined'
      ? window?.ethereum
      : new ethers.providers.JsonRpcProvider(webProviderUri),
  webProviderUri,
  marketplaceUri,
  neverminedNodeUri,
  faucetUri,
  neverminedNodeAddress,
  secretStoreUri,
  verbose,
  marketplaceAuthToken:
    typeof window !== 'undefined' ? AuthToken.fetchMarketplaceApiTokenFromLocalStorage().token : '',
  artifactsFolder,
  graphHttpUri: graphUrl
}

const Header = () => {
  const {walletAddress} = useWallet()
    return (
      <UiHeader>
        <UiHeaderLink href="/list">Marketplace</UiHeaderLink>
        {walletAddress && <UiHeaderLink href="/account">Account</UiHeaderLink>}
        <UiHeaderLink href="https://1milliontoken.org/">MTM</UiHeaderLink>
        <UiHeaderLink href="/about">Why MTM?</UiHeaderLink>

      </UiHeader>
    )
}

function App({ Component, pageProps }: AppProps) {
  Logger.setLevel(3)
  const MainComponent = Component as any

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Catalog.NeverminedProvider config={appConfig}>
        <WalletProvider
          client={getClient()}
          correctNetworkId={Number(correctNetworkId)}
          connectKitProps={{
            theme: 'rounded'
          }}
        >
          <AssetService.AssetPublishProvider>
            <UserProvider>
              <Head>
                <meta name="description" content="MTM DeFi Marketplace" />
                <link rel="icon" href="/favicon.ico" />
              </Head>
              <div>
                <Header/>
                <MainComponent {...pageProps} />
              </div>

              <UiDivider flex />
              <UiFooter />
            </UserProvider>
          </AssetService.AssetPublishProvider>
        </WalletProvider>
      </Catalog.NeverminedProvider>
    </div>
  )
}
export default App
