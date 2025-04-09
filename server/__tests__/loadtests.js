import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    {
      duration: '60s',
      target: 10
    }
  ]
};

export default function() {
  http.get(`http://18.119.167.80:3000/api/qa/questions?product_id=1`, {
    timeout: '180s'
  });
  sleep(1);
}