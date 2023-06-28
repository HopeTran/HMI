/* tslint:disable:ordered-imports */
import React from 'react';

interface ErrorPageProps {
  error: any;
}

export default function ErrorPage(props: ErrorPageProps) {
  return (
    <div className="page-not-found error-page container">
      <div className="content">
          <div className="tw-container tw-m-auto tw-p-4">
            <h1 className="text">{props.error.message}</h1>
            <a href="/" className="go-back-home">
                <span>Go back home</span>
            </a>
        </div>
      </div>
    </div>
  );
}
