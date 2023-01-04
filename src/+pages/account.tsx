import type { NextPage } from 'next'
import React, { useEffect, useState, useContext } from 'react'
import { UiText, UiDivider, UiLayout, BEM, UiButton } from '@nevermined-io/styles'
import styles from './account.module.scss'
import { UserProfile } from './user-profile'
import { User } from '../context'
import { Catalog } from '@nevermined-io/catalog-core'
import { useWallet } from '@nevermined-io/catalog-providers'
import { DDO } from '@nevermined-io/nevermined-sdk-js'
import { loadUserPublished, loadUserDownloads } from 'src/shared/graphql'
import { Summary } from 'ui/+account/summary'
import { AssetsList } from './assets-list'
import Router from 'next/router'
import {Card} from '../components/card/card'

const b = BEM('account', styles)
export const Account: NextPage = () => {
  const [view, setView] = useState<number>(0)
  const [published, setPublished] = useState<DDO[]>([])
  const [downloaded, setDownloaded] = useState<DDO[]>([])
  const { bookmarks, setBookmarks } =
    useContext(User)
  const { sdk, isLoadingSDK, assets } = Catalog.useNevermined()
  const { walletAddress } = useWallet()

  const loadUserInfo = async () => {
    if(isLoadingSDK || !walletAddress) {
      return
    }

    try{ 
        const userProfile = await sdk.profiles.findOneByAddress(walletAddress)
        // const bookmarks = await sdk.bookmarks.findManyByUserId(userProfile.userId)

        // if(bookmarks) {
        //   const bookmarksDDO = await Promise.all(
        //     bookmarks.results?.map((bookmark) => sdk.assets.resolve(bookmark.did))
        //   )
        //   setBookmarks(bookmarksDDO)
        // }

        const published = await assets.query({
          query: {
            match: {
              'proof.creator': walletAddress
            }
          }
        })

        let downloaded = await loadUserDownloads(sdk, walletAddress)
        downloaded = downloaded.map((asset: any) => asset._did)
        // removing duplicates
        downloaded = [...new Set(downloaded)]
        const downloadedDDO: DDO[] = await Promise.all(
          downloaded.map(async (did: any) => await sdk.assets.resolve(did))
        )

      setPublished(published.results)
      setDownloaded(downloadedDDO)

    }catch(error: unknown){
      console.error("Error loading user info: " + error)
    }

  }

  const loadCards = (ddos: DDO[]) => (
    <UiLayout className={b('card-container')}>
      {ddos.map(a => (
          <Card ddo={a} />
      ))}
    </UiLayout>
  )

  useEffect(() => {
    loadUserInfo()
  }, [walletAddress])

  const publishAsset = () => {
    Router.push('/user-publish')
  }

  const renderContent = () => {
    if (view == 0) {
      return (
        <Summary
          published={published}
          bookmarks={bookmarks}
          downloaded={downloaded}
        />
      )
    } else if (view == 1) {
      return <UserProfile />
    } else if (view == 2) {
      return (
        <>
          <UiButton onClick={() => publishAsset()}>Publish new asset</UiButton>
          {loadCards(published)}
        </>
      )
    } else if (view == 3) {
      return loadCards(downloaded)
      
      
    } else if (view == 4) {
      return loadCards(bookmarks)
    }
  }

  return (
    <>
      <UiLayout type="container">
        <div className={b('header')}>
          <div className={b('user-name')}>Welcome back</div>
          <div className={b('account-title')}>
            <UiText block type="h2" className={b('text')}>
              Your account
            </UiText>
          </div>
        </div>
        <div className={b('row')}>
          <div className={b('columnleft')}>
            <UiText
              className={b('pointer', view === 0 ? ['active'] : [])}
              type="link-caps"
              variants={['detail']}
              onClick={() => setView(0)}
            >
              Dashboard
            </UiText>
            <UiDivider />
            <UiText
              className={b('pointer', view === 1 ? ['active'] : [])}
              type="link-caps"
              variants={['detail']}
              onClick={() => setView(1)}
            >
              Profile
            </UiText>
            <UiDivider />
            <UiText
              className={b('pointer', view === 2 ? ['active'] : [])}
              type="link-caps"
              variants={['detail']}
              onClick={() => setView(2)}
            >
              Published Assets
            </UiText>
            <UiDivider />
            <UiText
              className={b('pointer', view === 3 ? ['active'] : [])}
              type="link-caps"
              variants={['detail']}
              onClick={() => setView(3)}
            >
              Downloads
            </UiText>
            <UiDivider />
            <UiText
              className={b('pointer', view === 4 ? ['active'] : [])}
              type="link-caps"
              variants={['detail']}
              onClick={() => setView(4)}
            >
              Bookmarks
            </UiText>
          </div>
          <div className={b('columnright')}>{renderContent()}</div>
        </div>
      </UiLayout>
    </>
  )
}
