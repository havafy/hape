import { FC } from 'react'
import Link from 'next/link'
import { Tabs } from 'antd';
import s from './TechStacks.module.css'
const { TabPane } = Tabs;

function callback(key: any) {
}

const TechStacks: FC = () => (
  <div className="techstacks px-5 mx-auto max-w-7xl my-16">
    <div className="justify-center text-center">
      <div className="mb-10">
          <h3 className="text-4xl font-medium text-gray-900 sm:px-0  justify-center heading-red">
          Tech Stacks
          </h3>
        </div>
      <div className="">
        <Tabs defaultActiveKey="1" centered>
        <TabPane tab="CMS" key="1">
            <ul className="itemCenter">
                <li><img src="/pages/TechStacks/Magento.svg" /></li>
                <li><img src="/pages/TechStacks/Shopify.svg" /></li>
                <li><img src="/pages/TechStacks/Wordpress.svg" /></li>
              </ul>
            </TabPane>
         

            <TabPane tab="Frontend" key="2">
            <ul className="itemCenter">
                <li><img src="/pages/TechStacks/ReactNative.svg" /></li>
                <li><img src="/pages/TechStacks/React.svg" /></li>
                <li><img src="/pages/TechStacks/Vue.svg" /></li>
                <li><img src="/pages/TechStacks/TypeScript.svg" /></li>
              </ul>
            </TabPane>
            <TabPane tab="Databases" key="3">
            <ul className="itemCenter">
                <li><img src="/pages/TechStacks/PostageSQL.svg" /></li>
                <li><img src="/pages/TechStacks/MySQL.svg" /></li>
                <li><img src="/pages/TechStacks/MongoDB.svg" /></li>
                <li><img src="/pages/TechStacks/ElasticSearch.svg" /></li>
                <li><img src="/pages/TechStacks/Redis.svg" /></li>
              </ul>
            </TabPane>
            <TabPane tab="Cloud" key="4">
            <ul className="itemCenter">
                <li><img src="/pages/TechStacks/Google cloud.svg" /></li>
                <li><img src="/pages/TechStacks/digital-ocean.svg" /></li>
                <li><img src="/pages/TechStacks/AWS.svg" /></li>
                <li><img src="/pages/TechStacks/Stripe.svg" /></li>
                <li><img src="/pages/TechStacks/twilio.svg" /></li>
              </ul>
            </TabPane>
            <TabPane tab="Backend" key="5">
              <ul className="itemCenter">
                <li><img src="/pages/TechStacks/PHP.svg" /></li>
                <li><img src="/pages/TechStacks/NodeJS.svg" /></li>
                <li><img src="/pages/TechStacks/Go.svg" /></li>
                <li><img src="/pages/TechStacks/RubyOnRails.svg" /></li>
              </ul>
            </TabPane>
            <TabPane tab="Testing" key="6">
            <ul className="itemCenter">
                <li><img src="/pages/TechStacks/TravisCI.svg" /></li>
                <li><img src="/pages/TechStacks/Selenium.svg" /></li>
                <li><img src="/pages/TechStacks/JMeter.svg" /></li>
              </ul>
            </TabPane>
            <TabPane tab="DevOps" key="7">
            <ul className="itemCenter">
                <li><img src="/pages/TechStacks/CircleCI.svg" /></li>
                <li><img src="/pages/TechStacks/Docker.svg" /></li>
                <li><img src="/pages/TechStacks/kubernetes.svg" /></li>
              </ul>
            </TabPane>
          </Tabs>
      </div>
      </div>
  </div>

)
export default TechStacks
