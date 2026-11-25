import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let controller: AppController;
  beforeEach(() => { controller = new AppController(new AppService()); });

  it('returns the application greeting', () => {
    expect(controller.getHello()).toBe('Hello World!');
  });

  it('returns the test endpoint message', () => {
    expect(controller.test()).toBe('Wow test works!');
  });
});
