import axios from "axios";
import { getAuthToken } from "../../src/utils/accounts";
import {
  YamlClassConfiguration,
  TriggerType,
  YamlProjectConfiguration,
  YamlSdkConfiguration,
  Language,
  JsRuntime
} from "../../src/models/yamlProjectConfiguration";
import { deployRequest } from "../../src/requests/deployCode";
import { ProjectConfiguration, SdkConfiguration, ClassConfiguration } from "../../src/models/projectConfiguration";

jest.mock("axios");
jest.mock("../../src/utils/accounts");

const mockedAxios = jest.mocked(axios, { shallow: true });
const mockedGetAuthToken = jest.mocked(getAuthToken, { shallow: true });

beforeEach(() => {
  mockedGetAuthToken.mockClear();
});

test("should throw error if server returns error", async () => {
  await expect(async () => {
    const projectConfiguration: ProjectConfiguration = {
      name: "test",
      region: "us-east-1",
      sdk: new SdkConfiguration(Language.js, JsRuntime.browser, "./test"),
      classes: [],
    }

    mockedGetAuthToken.mockResolvedValue("token");
    mockedAxios.mockResolvedValue({
      data: { status: "error" },
      status: 200,
      statusText: "Ok",
      headers: {},
      config: {}
    });

    await deployRequest(projectConfiguration);
  }).rejects.toThrowError();
});

test("should throw error if server returns data.error object", async () => {
  await expect(async () => {
    const projectConfiguration: ProjectConfiguration = {
      name: "test",
      region: "us-east-1",
      sdk: new SdkConfiguration(Language.js, JsRuntime.browser, "./test"),
      classes: [],
    }
    mockedGetAuthToken.mockResolvedValue("token");
    mockedAxios.mockResolvedValue({
      data: { error: { message: "error text" } },
      status: 200,
      statusText: "Ok",
      headers: {},
      config: {}
    });

    await deployRequest(projectConfiguration);
  }).rejects.toThrowError();
});

test("should return response.data if everything is ok", async () => {
  const someObject = { someData: "data" };
  const projectConfiguration: ProjectConfiguration = {
    name: "test",
    region: "us-east-1",
    sdk: new SdkConfiguration(Language.js, JsRuntime.browser, "./test"),
    classes: [],
  }
  mockedGetAuthToken.mockResolvedValue("token");
  mockedAxios.mockResolvedValue({
    data: someObject,
    status: 200,
    statusText: "Ok",
    headers: {},
    config: {}
  });

  const response = await deployRequest(projectConfiguration);
  expect(response).toEqual(someObject);
});

test("should read token and pass it to headers", async () => {
  const someObject = { someData: "data" };
  const projectConfiguration: ProjectConfiguration = {
    name: "test",
    region: "us-east-1",
    sdk: new SdkConfiguration(Language.js, JsRuntime.browser, "./test"),
    classes: [],
  }
  mockedGetAuthToken.mockResolvedValue("token");
  mockedAxios.mockResolvedValue({
    data: someObject,
    status: 200,
    statusText: "Ok",
    headers: {},
    config: {}
  });

  const response = await deployRequest(projectConfiguration);

  expect(mockedGetAuthToken.mock.calls.length).toBe(1);

  expect(response).toEqual(someObject);
});