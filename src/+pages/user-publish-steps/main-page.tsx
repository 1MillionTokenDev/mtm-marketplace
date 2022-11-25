import React, { useState, useRef, useEffect } from 'react'
import {
  BEM,
  UiForm,
  UiLayout,
  UiText,
  UiPopupHandlers,
  NotificationPopup,
  UiDivider
} from '@nevermined-io/styles'
import {
  Catalog,
  AssetFile,
  AssetService,
  RoyaltyKind,
  getRoyaltyScheme,
  AssetRewards,
  BigNumber,
  MetaData
} from '@nevermined-io/catalog-core'
import { useWallet } from '@nevermined-io/catalog-providers'
import { NextPage } from 'next'
import { BasicInfoStep } from './basic-info'
import { FilesStep } from './files'
import { handleAssetFiles, FileType } from './files-handler'
import { toast } from '../../components'
import { neverminedNodeAddress, erc20TokenAddress, categories } from 'src/config'
import { PricesStep } from './prices'
import { ProgressBar } from './progress-bar/progress-bar'
import styles from './publish-asset.module.scss'

const b = BEM('publish-asset', styles)

export const UserPublishMultiStep: NextPage = () => {
  const {
    errorAssetMessage,
    setErrorAssetMessage,
    setAssetMessage,
    assetPublish,
    setAssetPublish,
    publishNFT1155
  } = AssetService.useAssetPublish()
  const [filesUploadedMessage, setFilesUploadedMessage] = useState<string[]>([])
  const popupRef = useRef<UiPopupHandlers>()
  const fileUploadPopupRef = useRef<UiPopupHandlers>()
  const txPopupRef = useRef<UiPopupHandlers>()
  const [step, setStep] = useState<number>(1)
  const [resultOk, setResultOk] = useState(false)
  const [isProcessComplete, setIsProcessComplete] = useState(false)
  const resultPopupRef = useRef<UiPopupHandlers>()
  const { sdk } = Catalog.useNevermined()
  const { walletAddress } = useWallet()

  useEffect(() => {
    setAssetPublish({
      ...assetPublish,
      category: 'None',
      protocol: 'None',
      network: 'MTM',
      price: 0,
      royaltyAmount: 0,
    })
  }, [])

  const resetValues = () => {
    setStep(1)
    setAssetPublish({
      name: '',
      author: '',
      description: '',
      type: 'nft-access',
      category: categories[0],
      protocol: 'None',
      network: 'polygon',
      price: 0,
      assetFiles: [],
      cap: BigNumber.from(1),
      royaltyAmount: 0,
    })
    setFilesUploadedMessage([])
    setErrorAssetMessage('')
    setAssetMessage('')
    setResultOk(false)
  }

  // go back to previous step
  const prevStep = () => {
    setStep(step - 1)
  }

  // proceed to the next step
  const nextStep = () => {
    setStep(step + 1)
  }

  const closePopup = (event: any) => {
    popupRef.current?.close()
    event.preventDefault()
  }

  interface FileMetadata {
    index: number
    contentType: string
    url: string
    contentLength: string
  }

  const generateFilesMetadata = () => {
    const files: FileMetadata[] = []
    assetPublish.assetFiles.forEach((assetFile: AssetFile, i: number) => {
      const file: FileMetadata = {
        index: i + 1,
        contentType: assetFile.content_type ? assetFile.content_type : '',
        url: assetFile.filecoin_id ? assetFile.filecoin_id : '',
        contentLength: assetFile.size ? assetFile.size : ''
      }
      files.push(file)
    })

    return files
  }

  const generateMetadata = () => {
    const metadata: MetaData = {
      curation: {
        rating: 0,
        numVotes: 0,
        isListed: true
      },
      main: {
        name: assetPublish.name,
        dateCreated: new Date().toISOString().replace(/\.[0-9]{3}/, ''),
        author: assetPublish.author,
        license: 'No License Specified',
        price: String(assetPublish.price),
        datePublished: new Date().toISOString().replace(/\.[0-9]{3}/, ''),
        type: 'dataset',
        network: assetPublish.network,
        files: generateFilesMetadata()
      },
      additionalInformation: {
        description: assetPublish.description,
        categories: [
          assetPublish.category
        ],
        blockchain: assetPublish.network,
        version: 'v1',
        source: 'filecoin'
      }
    } as MetaData

    return metadata
  }

  const generateFilesUploadedMessage = (assetFiles: AssetFile[]) => {
    const messages: string[] = []
    for (const assetFile of assetFiles) {
      const isLocalFile: boolean = assetFile.type === FileType.Local
      if (isLocalFile)
        messages.push(
          `- File ${assetFile.name} uploaded to Filecoin with ID: ${assetFile.filecoin_id}`
        )
    }
    return messages
  }

  const uploadFiles = async () => {
    const findLocal = assetPublish.assetFiles.find((file) => file.type === FileType.Local)

    if (findLocal) {
      fileUploadPopupRef.current?.open()
      await handleAssetFiles(assetPublish.assetFiles)
      setFilesUploadedMessage(generateFilesUploadedMessage(assetPublish.assetFiles))
      fileUploadPopupRef.current?.close()
    }
  }

  const onSubmitUserPublish = async () => {
    try {
      await uploadFiles()
      txPopupRef.current?.open()

      const assetRewardsMap = new Map([
        [walletAddress, BigNumber.from(assetPublish.price)]
      ])

      const assetRewards = new AssetRewards(assetRewardsMap)

      const networkFee = await sdk.keeper.nvmConfig.getNetworkFee()
      const feeReceiver = await sdk.keeper.nvmConfig.getFeeReceiver()
      assetRewards.addNetworkFees(feeReceiver, BigNumber.from(networkFee))

      const royaltyAttributes = {
        royaltyKind: RoyaltyKind.Standard,
        scheme: getRoyaltyScheme(sdk, RoyaltyKind.Standard),
        amount: assetPublish.royaltyAmount
      }

      publishNFT1155({
        metadata: generateMetadata(),
        neverminedNodeAddress,
        assetRewards,
        royaltyAttributes: royaltyAttributes,
        preMint: true,
        cap: assetPublish.cap,
        erc20TokenAddress,
      })
        .then(() => {
          setResultOk(true)
          txPopupRef.current?.close()
          resultPopupRef.current?.open()
          toast.success(`Asset published correctly in the Marketplace`)
        })
        .catch((error) => {
          txPopupRef.current?.close()
          setResultOk(false)
          if (error.message.includes('Transaction was not mined within 50 blocks')) {
            setErrorAssetMessage(
              'Transaction was not mined within 50 blocks, but it might still be mined. Check later the Published Assets section in your Account'
            )
          }
          resultPopupRef.current?.open()
          toast.error(errorAssetMessage)
        })
    } catch (error: any) {
      setErrorAssetMessage(error.message)
      popupRef.current?.open()
    }
  }

  const updateFilesAdded = (assetFile: AssetFile) => {
    const arrayFiles: AssetFile[] = assetPublish.assetFiles
    setAssetPublish({ ...assetPublish, assetFiles: [...arrayFiles, assetFile] })
  }

  const removeFile = (label: string) => {
    const arrayFiles: AssetFile[] = assetPublish.assetFiles

    const indexOfObject = arrayFiles.findIndex((assetFile) => {
      return assetFile.label === label
    })

    if (indexOfObject !== -1) {
      arrayFiles.splice(indexOfObject, 1)
      setAssetPublish({ ...assetPublish, assetFiles: [...arrayFiles] })
    }
  }

  return (
    <UiLayout type="container" className={b()}>
      <NotificationPopup closePopup={closePopup} message={errorAssetMessage} popupRef={popupRef} />
      <UiLayout type="container">
        <UiText type="h2" wrapper="h2">
          Publish new asset
        </UiText>
        <UiDivider className={b('divider-line', ['fade'])} />
        <ProgressBar currentStep={step} totalSteps={3} isProcessComplete={isProcessComplete} />
        <UiForm className={b('step-container')}>
          {step === 1 && <BasicInfoStep nextStep={nextStep} />}
          {step === 2 && <PricesStep nextStep={nextStep} prevStep={prevStep}/>}
          {step === 3 && (
            <FilesStep
              prevStep={prevStep}
              updateFilesAdded={updateFilesAdded}
              removeFile={removeFile}
              submit={onSubmitUserPublish}
              filesUploadedMessage={filesUploadedMessage}
              fileUploadPopupRef={fileUploadPopupRef}
              txPopupRef={txPopupRef}
              resultOk={resultOk}
              resultPopupRef={resultPopupRef}
              reset={resetValues}
              setIsProcessComplete={setIsProcessComplete}
            />
          )}
        </UiForm>
      </UiLayout>
    </UiLayout>
  )
}
