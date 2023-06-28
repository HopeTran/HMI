import { TabPanel, TabView, TabViewProps } from 'primereact/tabview';
import React, { useState } from 'react';

interface Props extends TabViewProps {
  tabPanels: any[];
  showContentHeader?: boolean;
  showContentFooter?: boolean;
}

export default function NplTabview(props: Props) {
  const [activeIndexTab, setActiveIndexTab] = useState<number>(0);

  const handleTabChange = (e: any) => {
    setActiveIndexTab(e.index);
    if (props.onTabChange) {
      props.onTabChange(e);
    }
  };

  return (
    <TabView
      className={`${props.className} npl-tabview`}
      renderActiveOnly={true}
      onTabChange={handleTabChange}
      activeIndex={activeIndexTab}
    >
      {props.tabPanels.map((tabPanel: any) => {
        return (
          <TabPanel key={tabPanel.key || tabPanel.header} header={tabPanel.header}>
            {props.showContentHeader && <div className="tab-header" />}
            {tabPanel.render()}
            {props.showContentFooter && <div className="tab-footer" />}
          </TabPanel>
        );
      })}
    </TabView>
  );
}
