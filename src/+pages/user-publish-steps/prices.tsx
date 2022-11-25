import React from 'react'
import {
  UiFormGroup,
  UiFormInput,
  Orientation,
  UiButton,
  UiLayout,
  BEM,
  UiDivider,
} from '@nevermined-io/styles'
import styles from './user-publish.module.scss'
import { AssetService } from '@nevermined-io/catalog-core'

const b = BEM('user-publish', styles)

interface PricesProps {
  prevStep: () => void
  nextStep: () => void
}

export const PricesStep = (props: PricesProps) => {
  const { assetPublish, handleChange } =
    AssetService.useAssetPublish()
  const {
    prevStep,
    nextStep,
  } = props

  const handleContinueClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    nextStep()
  }

  const handlePreviousClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    prevStep()
  }

  return (
    <UiLayout type="container">
      <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
        <UiFormInput
          className={b('publish-form-input')}
          label="Set Your Price (MTM)"
          type='number'
          value={assetPublish.price}
          onChange={(e) => handleChange(e.target.value, 'price')}
        />
      </UiFormGroup>
      <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
        <UiFormInput
          className={b('publish-form-input')}
          label="Set royalty of your asset"
          type='number'
          value={assetPublish.royaltyAmount}
          onChange={(e) => handleChange(e.target.value, 'royaltyAmount')}
        />
      </UiFormGroup>
      <UiDivider/>
      <UiFormGroup orientation={Orientation.Vertical}>
          <UiButton
            type="secondary"
            onClick={handlePreviousClick}
            className={b('button', ['secondary'])}
          >
            Back
          </UiButton>
          <UiButton onClick={handleContinueClick} className={b('button')}>
            Continue
          </UiButton>
        </UiFormGroup>
    </UiLayout>
  )
}
