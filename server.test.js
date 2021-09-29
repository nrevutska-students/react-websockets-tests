const { expect } = require('@jest/globals');
const WebSocket = require('ws');
const wss = require('../server/index');

describe('index.html', () => {
  test(`WebSocket Server uses its \'clients\' property`, async () => {

    const ws = new WebSocket("ws://localhost:8082");
    await new Promise(resolve => ws.onopen = resolve);    
    
    let clientsCount = wss.clients.size;
    ws.close();

    expect(clientsCount).toEqual(1);
  });  

  test("WebSocket Server is sending back received data", async () => {

    const ws = new WebSocket("ws://localhost:8082");
    await new Promise(resolve => ws.onopen = resolve);

    let messageToReceive = new Promise(resolve => ws.onmessage = message => {
      resolve(message.data);         
    })
    ws.send('This is test data');
    let receivedMessage = await messageToReceive;
    ws.close();

    expect(receivedMessage.endsWith('This is test data')).toBeTruthy();
  });

  test("WebSocket Server is sending received data to all its clients", async () => {

    const ws1 = new WebSocket("ws://localhost:8082");
    const ws2 = new WebSocket("ws://localhost:8082");
    await new Promise(resolve => ws1.onopen = resolve);
    await new Promise(resolve => ws2.onopen = resolve);

    let messageToReceive1 = new Promise(resolve => ws1.onmessage = message => {
      resolve(message.data);         
    })
    let messageToReceive2 = new Promise(resolve => ws2.onmessage = message => {
      resolve(message.data);         
    })
    ws1.send('This is test data');
    let receivedMessage1 = await messageToReceive1;
    let receivedMessage2 = await messageToReceive2;

    ws1.close();
    ws2.close();
    
    expect(receivedMessage1).toEqual(receivedMessage2);
  });

  afterAll(() => {  
    wss.close();    
  })

})
