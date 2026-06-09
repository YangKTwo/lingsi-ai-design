/**
 * Taro App 入口组件
 */
import { Component, PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { APP_NAME } from './services/types'
import './app.scss'

function App({ children }: PropsWithChildren<object>) {
  useLaunch(() => {
    console.log(`${APP_NAME} 小程序启动`)
  })

  // children 是将要渲染的页面
  return <>{children}</>
}

export default App
