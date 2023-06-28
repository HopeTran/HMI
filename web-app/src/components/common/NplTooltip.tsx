import React from 'react';
import ReactTooltip, { TooltipProps } from 'react-tooltip';

import { isDesktop } from '../../utilities/common';

export default function NplTooltip(props: TooltipProps) {
  return isDesktop() ? <ReactTooltip {...props} /> : <></>;
}
