import { DDO } from '@nevermined-io/catalog-core'
import { UiLayout, UiText, BEM } from '@nevermined-io/styles'
import styles from './card.module.scss'

const b = BEM('card', styles)

export const Card = ({ddo}: {ddo: DDO}) => {
  const additionalInformation = ddo.findServiceById(0).attributes.additionalInformation
  const price = ddo.findServiceByType('nft-sales').attributes.additionalInformation.priceHighestDenomination
  const main = ddo.findServiceById(0).attributes.main

  return (
    <UiLayout className={b('content')}>
      <UiLayout className={b('title')}>
        <UiText type='h3'>{main.name}</UiText>
      </UiLayout>
      <UiLayout className={b('image')}>
        <img src={additionalInformation.link}/>
      </UiLayout>
      <UiLayout className={b('description')}>
        <UiText>{additionalInformation.description}</UiText>
      </UiLayout>
      <UiLayout className={b('footer')}>
        <UiLayout className={b('author')}>
          <UiText type='small'>Author: {main.author}</UiText>
        </UiLayout>
        <UiLayout className={b('category')}>
          <UiText type='small-caps'>{additionalInformation.categories[0]}</UiText>
        </UiLayout>
      </UiLayout>
      <UiLayout className={b('price')}>
        <UiText type='h4'>{price} MTM</UiText>
      </UiLayout>
    </UiLayout>
  )
  
}