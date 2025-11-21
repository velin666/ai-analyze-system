// Our official coze sdk for JavaScript [coze-js](https://github.com/coze-dev/coze-js)
import { CozeAPI } from '@coze/api';

const apiClient = new CozeAPI({
  token: 'cztei_hb0jiElxbrOyBJYn0wbBKZMTfUJTUcWltqtjLoOvQo51G6pBILr8MVnF4ws2dS66D',
  baseURL: 'https://api.coze.cn'
});
const res = await apiClient.workflows.runs.stream({
  workflow_id: '7573337879529062440',
  parameters: {
  "bit1": 0,
  "table_summary": "工程总监任命通知",
  "xml_content": ""
},
})