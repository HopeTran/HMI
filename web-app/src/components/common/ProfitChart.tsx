import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsStock from 'highcharts/modules/stock';
import { sumBy } from 'lodash';
import moment from 'moment';
import { formatNumberWithAbbreviation } from 'utilities/common';

highchartsStock(Highcharts);

Highcharts.SVGRenderer.prototype.symbols.download = function (x: any, y: any, w: any, h: any) {
  var path = [
    // Arrow stem
    'M',
    x + w * 0.5,
    y,
    'L',
    x + w * 0.5,
    y + h * 0.7,
    // Arrow head
    'M',
    x + w * 0.3,
    y + h * 0.5,
    'L',
    x + w * 0.5,
    y + h * 0.7,
    'L',
    x + w * 0.7,
    y + h * 0.5,
    // Box
    'M',
    x,
    y + h * 0.9,
    'L',
    x,
    y + h,
    'L',
    x + w,
    y + h,
    'L',
    x + w,
    y + h * 0.9,
  ];
  return path;
};

interface Props {
  data: any;
  type: string;
}

export default function ProfitChart(props: Props) {
  const [options, setOptions] = useState<any>(DEFAULT_OPTIONS);

  let days: any = [];
  for (var i = 0; i < 7; i++) {
    let day = subtractDays(i);
    days.push(moment(day).format('dddd'));
  }

  useEffect(() => {
    let weekday = days.reverse();
    if (props.data) {
      setOptions(chartData(props.data, weekday, props.type));
    }
  }, [props.data]);

  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
}

function subtractDays(numOfDays: any, date = new Date()) {
  date.setDate(date.getDate() - numOfDays);
  return date;
}

const DEFAULT_OPTIONS = {
  chart: {
    type: 'areaspline',
    marginTop: 100,
  },
  yAxis: {},
  tooltip: {
    shared: true,
    valueSuffix: ' units',
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.6,
      lineWidth: 3,
    },
  },
};

const chartData = (data: any, days: [], type: string) => {
  if (data) {
    const series = [
      {
        name: 'Last 7 - 14 days',
        data:
          data.lastWeek &&
          data.lastWeek.reverse().map((item: any) => {
            return item.profit;
          }),
        color: 'rgba(53, 88, 15, 0.3)',
        lineColor: 'rgba(53, 88, 15, 0.1)',
        fillOpacity: 0.3,
        events: {
          mouseOver: function (this: any) {
            this.update({
              lineColor: 'rgba(53, 88, 15, 0.87)',
            });
          },
          mouseOut: function (this: any) {
            this.update({
              lineColor: 'rgba(53, 88, 15, 0.1)',
            });
          },
        },
      },
      {
        name: 'Last 7 days',
        data:
          data.thisWeek &&
          data.thisWeek.reverse().map((item: any) => {
            return item.profit;
          }),
        color: '#668B6D',
        lineColor: 'rgba(53, 88, 15, 0.87)',
      },
    ];
    const options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), {
      title: {
        text: '',
        y: 70,
      },
      series: series,
      xAxis: {
        categories: days,
      },
      yAxis: {
        title: {
          text: type === 'gross' ? 'Gross Sales' : 'Total Order',
        },
        labels: {
          format: type === 'gross' ? '${text}' : '{text}',
        },
      },
      tooltip: {
        formatter: function (this: any) {
          return [
            '<h5>' + this.key + '</h5>',
            '<br>',
            '<b>' +
              (type === 'gross' ? '$' : '') +
              formatNumberWithAbbreviation(Math.abs(this.y), 2) +
              ' ' +
              (type === 'gross' ? '' : 'orders') +
              '</b>',
            '<br>',
            '<span>' + this.series.name + '</span>',
          ];
        },
      },
      legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        floating: true,
        borderWidth: 0,
        labelFormatter: function (this: any) {
          return (
            '<span>' +
            (type === 'gross' ? '$' : '') +
            formatNumberWithAbbreviation(
              sumBy(this.name === 'Last 7 days' ? data.thisWeek : data.lastWeek, function (o: any) {
                return o.profit;
              }),
              2,
            ) +
            '</span>' +
            ' ' +
            (type === 'total' ? 'orders' : '') +
            ' ' +
            '<span>(' +
            this.name +
            ')</span>'
          );
        },
      },
    });
    return options;
  }
};
