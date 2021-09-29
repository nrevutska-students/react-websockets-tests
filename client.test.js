let { fireEvent, getByText } = require('@testing-library/dom');
let { JSDOM } = require('jsdom');

let fs = require('fs');
let path = require('path');
const { expect } = require('@jest/globals');

const WebSocket = require("./socket.js");

const codeDirectory = path.join(__dirname, '..');
const html = fs.readFileSync(codeDirectory + '/index.html', 'utf-8');
const options = {
  resources: 'usable',
  runScripts: 'dangerously',
};
const scriptContent = fs.readFileSync(codeDirectory + '/client.js', 'utf8');

let button;
let inputUserName;
let inputMessage;
let chat;

describe('index.html', () => {
  beforeEach(() => {
    const dom = new JSDOM(html, options)

    let window = dom.window;
    document = window.document;
    window.WebSocket = WebSocket;

    let scriptElement = document.createElement('script');
    scriptElement.textContent = scriptContent;
    document.head.appendChild(scriptElement);

    button = getByText(document, 'Send')
    inputUserName = document.querySelector('#userName');
    inputMessage = document.querySelector('#message');
    chat = document.querySelector('#chat');
  })

  const cases = [
    ['Sender',
      'This text will be sent to WebSocket Server',
      'Sender: This text will be sent to WebSocket Server'],
    ['Another sender',
      'Message 2',
      'Another sender: Message 2'
    ]];
  test.each(cases)(
    "With given sender %p and message %p client sends %p to the server.",
    (sender, message, result) => {
      inputUserName.value = sender
      inputMessage.value = message;
      const { jest } = require('@jest/globals');
      const spy = jest.spyOn(WebSocket.instance, 'send');

      fireEvent.click(button);

      expect(spy).toHaveBeenCalledWith(result);
    });

  test("Data is displayed correctly when received from WebSocket Server", () => {
    WebSocket.instance.send('This is test data');
    WebSocket.instance.send('And another test data')

    expect(chat.value.endsWith('This is test data\nAnd another test data\n')).toBeTruthy();
  });

  test("WebSocket is used correctly on the client to send and receive messages", () => {
    inputUserName.value = 'Helga';
    inputMessage.value = 'Hello!';
    fireEvent.click(button);

    expect(chat.value.endsWith('Helga: Hello!\n')).toBeTruthy();
  });
})