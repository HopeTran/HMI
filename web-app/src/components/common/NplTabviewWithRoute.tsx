import { TabPanel, TabView, TabViewProps } from 'primereact/tabview';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, Route, withRouter } from 'react-router-dom';

import { isMobile } from '../../utilities/common';

interface Props extends TabViewProps, RouteComponentProps {
  tabPanels: any[];
  badges?: number[];
}
function NplTabviewWithRoute(props: Props) {
  const [activeIndexTab, setActiveIndexTab] = useState<number>(0);

  const handleTabChange = (e: any) => {
    setActiveIndexTab(e.index);
    if (props.tabPanels[e.index].url) {
      props.history.push(props.tabPanels[e.index].url);
    }
    if (props.onTabChange) {
      props.onTabChange(e);
    }
  };

  useEffect(() => {
    if (props.tabPanels) {
      const index = props.tabPanels.findIndex((item) => props.location.pathname.indexOf(item.url) !== -1);
      if (index >= 0) {
        setActiveIndexTab(index);
      } else {
        setActiveIndexTab(0);
        if (props.tabPanels[0].url) {
          props.history.push(props.tabPanels[0].url);
        }
      }
    }
  }, [props.tabPanels]);

  return (
    <TabView
      className={`${props.className} npl-tabview`}
      renderActiveOnly={true}
      onTabChange={handleTabChange}
      activeIndex={activeIndexTab}
    >
      {props.tabPanels.map((tabPanel: any, index: number) => {
        const headerBadge = props.badges && props.badges[index] ? '(' + props.badges[index] + ')' : '';
        const header = `${isMobile() && tabPanel.shortHeader ? tabPanel.shortHeader : tabPanel.header} ${headerBadge}`;
        return (
          <TabPanel key={tabPanel.header} header={header}>
            <Route path={tabPanel.url} render={tabPanel.render} />
            {tabPanel.tabFooter && <div className="tab-footer tw-container tw-m-auto" />}
          </TabPanel>
        );
      })}
    </TabView>
  );
}

export default withRouter(NplTabviewWithRoute);
