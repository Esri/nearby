
// Copyright 2020 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

import { default as applicationBaseConfig } from "../config/applicationBase"
import { default as applicationConfig } from "../config/application";
import ApplicationBase from "TemplatesCommonLib/baseClasses/ApplicationBase";
import { handleT9N } from "TemplatesCommonLib/structuralFunctionality/t9nUtils";
import { eachAlways } from "esri/core/promiseUtils";

import Application = require("./Main");


eachAlways([
  handleT9N("nearby", "nearby", "nearby/app/t9n/common"),
  handleT9N("instant", "instant", "instant/../t9n/common")
]).then(results => {

  const [appBundle, bundle] = results;

  const Main = new Application();
  new ApplicationBase({
    config: applicationConfig,
    settings: applicationBaseConfig as any
  })
    .load()
    .then(base => {
      base.config.bundle = bundle?.value;
      base.config.appBundle = appBundle?.value;
      Main.init(base);
    }
      , (message) => {
        if (message === "identity-manager:not-authorized") {
          document.body.classList.remove("configurable-application--loading");
          document.body.classList.add("app-error");
          document.body.innerHTML = `<h1>${bundle.licenseError.title}</h1><p>${bundle.licenseError.message}</p>`;
        } else if (message?.error === "application:origin-other") {
          document.location.href = `../../shared/origin/index.html?appUrl=${message.appUrl}`;
        } else if (message?.message === "Item does not exist or is inaccessible.") {
          document.body.classList.remove("configurable-application--loading");
          document.body.classList.add("app-error");
          document.body.innerHTML = `<p>${message?.message}</p>`;
        }
      });
})



