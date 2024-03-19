import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { act, render, screen } from '@testing-library/react';
import 'jest-localstorage-mock';
import 'jest-location-mock';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import userEvent from '@testing-library/user-event';
import { store } from 'state/store';
import { StaticMockLink } from 'utils/StaticMockLink';
import i18nForTest from 'utils/i18nForTest';
import Requests from './Requests';
import {
  EMPTY_MOCKS,
  MOCKS_WITH_ERROR,
  MOCKS,
  MOCKS2,
  EMPTY_REQUEST_MOCKS,
} from './RequestsMocks';
import useLocalStorage from 'utils/useLocalstorage';

const { setItem } = useLocalStorage();

const link = new StaticMockLink(MOCKS, true);
const link2 = new StaticMockLink(EMPTY_MOCKS, true);
const link3 = new StaticMockLink(EMPTY_REQUEST_MOCKS, true);
const link4 = new StaticMockLink(MOCKS2, true);
const link5 = new StaticMockLink(MOCKS_WITH_ERROR, true);

async function wait(ms = 100): Promise<void> {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

beforeEach(() => {
  setItem('UserType', 'ADMIN');
  setItem('id', 'user1');
});

afterEach(() => {
  localStorage.clear();
});

describe('Testing Requests screen', () => {
  test('Component should be rendered properly', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
    expect(screen.getByTestId('testComp')).toBeInTheDocument();
  });

  test(`Component should be rendered properly when user is not Admin
  and or userId does not exists in localstorage`, async () => {
    setItem('UserType', 'SUPERADMIN');
    setItem('id', '');
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
  });

  test('Component should be rendered properly when user is Admin', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
  });

  test('Redirecting on error', async () => {
    render(
      <MockedProvider addTypename={false} link={link5}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
    expect(window.location.href).toEqual('http://localhost/orglist');
  });

  test('Testing Search requests functionality', async () => {
    render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
    const searchBtn = screen.getByTestId('searchButton');
    const search1 = 'John';
    userEvent.type(screen.getByTestId(/searchByName/i), search1);
    userEvent.click(searchBtn);
    await wait();

    const search2 = 'Pete{backspace}{backspace}{backspace}{backspace}';
    userEvent.type(screen.getByTestId(/searchByName/i), search2);

    const search3 =
      'John{backspace}{backspace}{backspace}{backspace}Sam{backspace}{backspace}{backspace}';
    userEvent.type(screen.getByTestId(/searchByName/i), search3);

    const search4 = 'Sam{backspace}{backspace}P{backspace}';
    userEvent.type(screen.getByTestId(/searchByName/i), search4);

    const search5 = 'Xe';
    userEvent.type(screen.getByTestId(/searchByName/i), search5);
    userEvent.clear(screen.getByTestId(/searchByName/i));
    userEvent.type(screen.getByTestId(/searchByName/i), '');
    userEvent.click(searchBtn);
    await wait();
  });

  test('Testing search not found', async () => {
    render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();

    const search = 'hello{enter}';
    await act(() =>
      userEvent.type(screen.getByTestId(/searchByName/i), search),
    );
  });

  test('Testing Request data is not present', async () => {
    render(
      <MockedProvider addTypename={false} link={link3}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
    expect(screen.getByText(/No Request Found/i)).toBeTruthy();
  });

  test('Should render warning alert when there are no organizations', async () => {
    render(
      <MockedProvider addTypename={false} link={link2}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <ToastContainer />
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait(200);
    expect(screen.queryByText('Organizations Not Found')).toBeInTheDocument();
    expect(
      screen.queryByText('Please create an organization through dashboard'),
    ).toBeInTheDocument();
  });

  test('Should not render warning alert when there are organizations present', async () => {
    const { container } = render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <ToastContainer />
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();

    expect(container.textContent).not.toMatch(
      'Organizations not found, please create an organization through dashboard',
    );
  });

  test('check for rerendering', async () => {
    const { rerender } = render(
      <MockedProvider addTypename={false} link={link}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <ToastContainer />
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );

    await wait();
    rerender(
      <MockedProvider addTypename={false} link={link4}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <ToastContainer />
              <Requests />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>,
    );
    await wait();
  });
});
