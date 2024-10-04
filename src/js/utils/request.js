import _ from 'lodash';
import axios from 'axios';
import { getCookie } from '../utils/cookie';
import { REACT_APP_BACKEND } from '../config';

const backend = axios.create({
  baseURL: REACT_APP_BACKEND,
});

function getToken() {
  const token = getCookie('token');
  if (!token) {
    window.location.reload();
    throw new Error('No token found');
  }
  return token;
}

export async function get(options) {
  try {
    const { data } = await backend({
      method: 'GET',
      url: options.path,
      headers: {
        'content-type': 'application/json',
        'x-token': getToken(),
      },
      ..._.omit(options, 'path'),
    });
    return data;
  } catch (e) {
    e.message = e.response.data || e.message;
    throw e;
  }
}

export async function post(options) {
  try {
    const { data } = await backend({
      method: 'POST',
      url: options.path,
      headers: {
        'content-type': 'application/json',
        'x-token': getToken(),
      },
      ..._.omit(options, 'path'),
    });
    return data;
  } catch (e) {
    e.message = e.response.data || e.message;
    throw e;
  }
}

export async function patch(options) {
  try {
    const { data } = await backend({
      method: 'PATCH',
      url: options.path,
      headers: {
        'content-type': 'application/json',
        'x-token': getToken(),
      },
      ..._.omit(options, 'path'),
    });
    return data;
  } catch (e) {
    e.message = e.response.data || e.message;
    throw e;
  }
}

export async function del(options) {
  try {
    const { data } = await backend({
      method: 'DELETE',
      url: options.path,
      headers: {
        'content-type': 'application/json',
        'x-token': getToken(),
      },
      ..._.omit(options, 'path'),
    });
    return data;
  } catch (e) {
    e.message = e.response.data || e.message;
    throw e;
  }
}

