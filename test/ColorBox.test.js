/* eslint-disable react/jsx-filename-extension */
/**
 * Copyright (c) Mik BRY
 * mik@mikbry.com
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ColorBox from '../src/components/ColorBox';

const palette = {
  red: '#ff0000',
  blue: '#0000ff',
  green: '#00ff00',
  yellow: 'yellow',
  cyan: 'cyan',
  lime: 'lime',
  gray: 'gray',
  orange: 'orange',
  purple: 'purple',
  black: 'black',
  white: 'white',
  pink: 'pink',
  darkBlue: 'darkBlue',
};

// See : https://github.com/testing-library/react-testing-library/issues/268
class FakeMouseEvent extends MouseEvent {
  constructor(type, values) {
    const { pageX, pageY, offsetX, offsetY, x, y, ...mouseValues } = values;
    super(type, mouseValues);

    Object.assign(this, {
      offsetX: offsetX || 0,
      offsetY: offsetY || 0,
      pageX: pageX || 0,
      pageY: pageY || 0,
      x: x || 0,
      y: y || 0,
    });
  }
}

const originalclientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
const originalclientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
const originalgetBoundingClientRect = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getBoundingClientRect');
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 308 });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 116 });
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ left: 22, top: 90 }),
  });
});

afterAll(() => {
  if (originalclientWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalclientWidth);
  if (originalclientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalclientHeight);
  if (originalgetBoundingClientRect)
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', originalgetBoundingClientRect);
});

test('ColorBox should render correctly', () => {
  const { asFragment } = render(<ColorBox defaultValue="darkBlue" />);
  expect(asFragment()).toMatchSnapshot();
});

test('ColorBox props', async () => {
  const { getAllByTestId, findByTestId } = render(<ColorBox defaultValue="#830A0A7D" />);
  const inputs = getAllByTestId('colorinput-input');
  expect(inputs.length).toBe(4);
  expect(inputs[0].value).toBe('830A0A7D');
  expect(inputs[1].value).toBe('131');
  expect(inputs[2].value).toBe('10');
  expect(inputs[3].value).toBe('10');
  const labels = getAllByTestId('colorinput-label');
  expect(labels.length).toBe(4);
  expect(labels[0].textContent).toBe('HEX');
  expect(labels[1].textContent).toBe('R');
  expect(labels[2].textContent).toBe('G');
  expect(labels[3].textContent).toBe('B');
  let component = await findByTestId('hsvgradient-color');
  expect(component).toHaveStyleRule('background', 'rgb(255,0,0) none repeat scroll 0% 0%');
  component = await findByTestId('hsvgradient-cursor');
  expect(component).toHaveStyle('left: 282px');
  expect(component).toHaveStyle('top: 56px');
  component = await findByTestId('hueslider');
  let span = component.querySelector('.MuiSlider-track');
  expect(span).toHaveStyle('width: 0%');
  span = component.querySelector('.MuiSlider-thumb');
  expect(span).toHaveStyle('left: 0%');
  component = await findByTestId('alphaslider');
  span = component.querySelector('.MuiSlider-track');
  expect(span).toHaveStyle('width: 49%');
  span = component.querySelector('.MuiSlider-thumb');
  expect(span).toHaveStyle('left: 49%');
});

test('ColorBox palette onChange', () => {
  let value;
  const onChange = jest.fn().mockImplementation(newValue => {
    value = newValue;
  });
  const { getAllByTestId } = render(<ColorBox value="darkblue" palette={palette} onChange={onChange} />);
  const buttons = getAllByTestId('colorbutton');
  expect(buttons.length).toBe(13);
  fireEvent.click(buttons[0]);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(value.name).toBe('red');
  expect(value.raw).toBe('#ff0000');
});

test('ColorBox deferred', () => {
  let value;
  const onChange = jest.fn().mockImplementation(newValue => {
    value = newValue;
  });
  const { getAllByTestId, getByText } = render(<ColorBox value="darkblue" deferred onChange={onChange} />);
  const inputs = getAllByTestId('colorinput-input');
  fireEvent.change(inputs[0], { target: { value: 'FF0000' } });
  expect(onChange).toHaveBeenCalledTimes(0);
  const button = getByText('Set');
  fireEvent.click(button);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(value.name).toBe('red');
  expect(value.raw).toBe('#FF0000');
});

test('ColorBox hsvgradient cursor changes', async () => {
  let value;
  const onChange = jest.fn().mockImplementation(newValue => {
    value = newValue;
  });
  const { findByTestId } = render(<ColorBox value="#7A0E30" onChange={onChange} />);
  let component = await findByTestId('hsvgradient-color');
  expect(component).toHaveStyleRule('background', 'rgb(255,0,81) none repeat scroll 0% 0%');
  component = await findByTestId('hsvgradient-cursor');
  expect(component).toHaveStyle('left: 273px');
  expect(component).toHaveStyle('top: 60px');
  expect(value).toBe(undefined);
  fireEvent(
    component,
    new FakeMouseEvent('mousemove', {
      bubbles: true,
    }),
  );
  expect(onChange).toHaveBeenCalledTimes(0);
  fireEvent(
    component,
    new FakeMouseEvent('mousedown', {
      bubbles: true,
    }),
  );
  expect(onChange).toHaveBeenCalledTimes(0);
  fireEvent(
    component,
    new FakeMouseEvent('mousemove', {
      bubbles: true,
      pageX: 25,
      pageY: 42,
      buttons: 1,
    }),
  );
  fireEvent(
    component,
    new FakeMouseEvent('mousemove', {
      bubbles: true,
      pageX: 1000,
      pageY: 1000,
      buttons: 1,
    }),
  );
  fireEvent(
    component,
    new FakeMouseEvent('mouseup', {
      bubbles: true,
      pageX: -500,
      pageY: -600,
    }),
  );
  expect(onChange).toHaveBeenCalledTimes(3);
  expect(value.name).toBe('white');
});

test('ColorBox sliders onChange', async () => {
  let value;
  const onChange = jest.fn().mockImplementation(newValue => {
    value = newValue;
  });
  const color = {
    raw: 'red',
    name: 'red',
    css: {
      backgroundColor: 'red',
    },
    value: 16711680,
    format: 'plain',
    hex: 'FF0000',
    alpha: undefined,
    rgb: [255, 0, 0],
    hsv: [0, 100, 100],
    hsl: [0, 100, 51],
  };
  const { getAllByTestId, findByTestId } = render(<ColorBox value={color} onChange={onChange} />);
  const inputs = getAllByTestId('colorinput-input');
  expect(inputs.length).toBe(4);
  let component = await findByTestId('hueslider');
  let span = component.querySelector('.MuiSlider-track');
  expect(span).toHaveStyle('width: 0%');
  span = component.querySelector('.MuiSlider-thumb');
  expect(span).toHaveStyle('left: 0%');
  fireEvent(
    span,
    new FakeMouseEvent('mousedown', {
      bubbles: true,
    }),
  );
  fireEvent(
    span,
    new FakeMouseEvent('mouseup', {
      bubbles: true,
      pageX: -500,
      pageY: -600,
    }),
  );
  expect(value.name).toBe('red');
  expect(onChange).toHaveBeenCalledTimes(1);

  component = await findByTestId('alphaslider');
  span = component.querySelector('.MuiSlider-track');
  expect(span).toHaveStyle('width: 100%');
  span = component.querySelector('.MuiSlider-thumb');
  expect(span).toHaveStyle('left: 100%');
  fireEvent(
    span,
    new FakeMouseEvent('mousedown', {
      bubbles: true,
    }),
  );
  fireEvent(
    span,
    new FakeMouseEvent('mouseup', {
      bubbles: true,
      pageX: -500,
      pageY: -600,
    }),
  );
  expect(value.name).toBe('red');
  expect(onChange).toHaveBeenCalledTimes(2);
});
