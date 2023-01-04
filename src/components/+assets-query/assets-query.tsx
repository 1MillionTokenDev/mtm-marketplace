import React, { ReactNode, useContext, useState, useEffect } from 'react'
import { DDO } from '@nevermined-io/nevermined-sdk-js'
import { Catalog } from '@nevermined-io/catalog-core'
import { useWallet } from '@nevermined-io/catalog-providers'
import { SearchQuery } from '@nevermined-io/nevermined-sdk-js'

import { Loader, UiLayout, BEM } from '@nevermined-io/styles'
import { User } from '../../context'
import styles from './assets-query.module.scss'
import { XuiPagination } from './pagination'
import { XuiSearchBar } from './search-bar'
import { Card } from '../card/card'

const b = BEM('assets-query', styles)

interface AssetsQueryProps {
  search?: 'onsite' | 'search-page'
  query?: SearchQuery['query']
  onlyBookmark?: boolean
  pageSize?: number
  content: (assets: DDO[]) => ReactNode | undefined
}

// loads all the asset then filters them looking at the variables defined in the user context
export function XuiAssetsQuery({
  search,
  content,
  pageSize = 12,
  onlyBookmark = false
}: AssetsQueryProps) {
  const {
    assets,
    searchInputText,
    selectedCategories,
    setAssets,
    setSelectedCategories,
    setToDate,
    setFromDate,
    setSearchInputText,
    setBookmarks,
    bookmarks,
    dropdownFilters
  } = useContext(User)
  const { fromDate, toDate } =
    dropdownFilters
  const { sdk } = Catalog.useNevermined()
  const { walletAddress } = useWallet()
  const [totalPages, setTotalPages] = useState<number>(1)
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  const textFilter = {
    nested: {
      path: ['service'],
      query: {
        query_string: { query: `*${searchInputText}*`, fields: ['service.attributes.main.name'] }
      }
    }
  }
  const categories = { 
    nested: {
      path: ['service'],
      query: {
        match: {
          'service.attributes.additionalInformation.categories': selectedCategories.join(', ')
        }
      }
    }
  }
  
  const nftAccess = { 
    nested: {
      path: ['service'],
      query: {
        match: { 'service.type': 'nft-sales' } }
      }
    }

  const dateFilter = fromDate !== '' &&
    toDate !== '' && {
      nested: {
        path: ['service'],
        query: {
          range: {
            'service.attributes.main.dateCreated': {
              time_zone: '+01:00',
              gte: fromDate,
              lte: toDate
            }
          }
        }
      }
    }

  // add listed into mustArray once we have a dataset with that property in the metadata
  //  const listed = { match: { 'service.attributes.curation.isListed': 'true' } }
  const mustArray = [textFilter, nftAccess]

  if (selectedCategories.length) {
    mustArray.push(categories as any)
  }

  dateFilter && mustArray.push(dateFilter as any)

  const query = {
    bool: {
      must: mustArray
    }
  }

  useEffect(() => {
    if (!sdk?.profiles) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(async () => {
      if (!walletAddress) return
      try{
          const userProfile = await sdk.profiles.findOneByAddress(walletAddress)
          if (!userProfile?.userId) {
            return
          }
          const bookmarksData = await sdk.bookmarks.findManyByUserId(userProfile.userId)
          const bookmarksDDO = await Promise.all(
            bookmarksData.results.map((b) => sdk.assets.resolve(b.did))
          )
          setBookmarks([...bookmarksDDO])
      } catch(error:unknown){
          console.error("Error loading user info: " + error)
      }
    })()
  }, [sdk])

  //this happen when the page is loaded to get the query string
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    for (const [key, value] of queryParams.entries()) {
      switch (key) {
        case 'searchInputText':
          queryParams.get('searchInputText')
            ? setSearchInputText(value)
            : setSearchInputText(searchInputText)
          break
        case 'selectedCategories':
          queryParams.get('selectedCategories')
            ? setSelectedCategories(value.split(','))
            : setSelectedCategories(selectedCategories)
          break
        case 'toDate':
          queryParams.get('toDate') ? setToDate(value) : setToDate(toDate)
          break
        case 'fromDate':
          queryParams.get('fromDate') ? setFromDate(value) : setFromDate(fromDate)
          break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    if (!sdk.assets) {
      return
    }
    setLoading(true)
    sdk.assets
      .query({
        offset: pageSize,
        page,
        query,
        sort: {
          created: 'desc'
        }
      })
      .then(({ results, totalPages }) => {
        if (onlyBookmark) {
          results = results.filter((item) => bookmarks?.some((bookmark) => bookmark.id === item.id))
        }

        setLoading(false)
        setAssets(results)
        setTotalPages(totalPages)
        history.replaceState(
          null,
          '',
          `/list?searchInputText=${searchInputText}&fromDate=${fromDate}&toDate=${toDate}&selectedCategories=${selectedCategories}`
        )
      })
  }, [sdk, page, JSON.stringify(query), bookmarks])

  return (
    <>
      {loading && <Loader />}
      {search && (
        <div>
          <XuiSearchBar />
          <UiLayout className={b('card-container')}>
            {assets.map(a => ( 
                <Card ddo={a} />
            ))}
          </UiLayout>
        </div>
      )}

      {content(assets)}

      {totalPages > 1 && <XuiPagination setPage={setPage} page={page} totalPages={totalPages} />}
    </>
  )
}
