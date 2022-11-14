import React, { useContext } from 'react'
import Router from 'next/router'
import { BEM, UiDivider, UiText, UiLayout } from '@nevermined-io/styles'
import Image from 'next/image'
import styles from './banner.module.scss'
import { XuiSearchBar } from 'ui/+assets-query/search-bar'
import { User } from 'src/context'

const b = BEM('banner', styles)

interface BannerProps {
  showButton: boolean
}

export function UiBanner(props: BannerProps) {
  const { fromDate, toDate, selectedCategories, setSearchInputText } = useContext(User)

  const onSearch = (searchString: any, priceRange: any) => {
    setSearchInputText(searchString)
    Router.push({
      pathname: '/list',
      query: {
        value: searchString,
        fromDate,
        toDate,
        selectedCategories,
        priceRange
      }
    })
  }

  return (
    <div className={b('bannerContainer')}>
      <Image src="/assets/million-token-matic.png" width="115" height="115" />
      <UiDivider type="s" />
      {props.showButton ? (
        <div>
          <UiDivider type="xl" />

          <UiLayout type="container">
            <XuiSearchBar
              onSearch={(searchString: any, priceRange: any) => onSearch(searchString, priceRange)}
            />
          </UiLayout>
          <UiDivider type="l" />
          <UiDivider type="xxl" />
        </div>
      ) : (
        <UiDivider type="l" />
      )}
    </div>
  )
}
