import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    // {
    //   duration: '60s',
    //   target: 1
    // }
    // {
    //   duration: '60s',
    //   target: 10
    // }
    {
      duration: '60s',
      target: 100
    }
  ]
  // 1 minute 1000
  // 1 minute 0

  // cloud: {
  //   // Project: k6
  //   projectID: 3748550,
  //   // Test runs with the same name groups test runs together.
  //   name: 'Test (18/02/2025-19:16:11)'
  // }
};

export default function() {
  http.get('http://localhost:3000/api/qa/questions?product_id=1');
  sleep(1);
}