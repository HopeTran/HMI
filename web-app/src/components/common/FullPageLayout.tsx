import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function FullPageLayout(props: Props) {
  return (
    <div className="full-page-layout authenticate-pages">
      <div className="wrapper">
        {/*Content*/}
        <div className="full-page-content body">{props.children}</div>
      </div>
    </div>
  );
}
