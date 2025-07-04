/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import BaseSimpleApplicationGenerator from '../base-simple-application/index.js';
import { GENERATOR_GIT } from '../generator-list.js';
import { files, readme } from './files.js';
import type { Application as InitApplication, Config as InitConfig, Options as InitOptions } from './types.js';

export default class InitGenerator extends BaseSimpleApplicationGenerator<InitApplication, InitConfig, InitOptions> {
  generateReadme = true;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:javascript:bootstrap');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async compose() {
        await this.composeWithJHipster(GENERATOR_GIT);
        const generatorOptions = { fromInit: true };
        await this.composeWithJHipster('jhipster:javascript:prettier', { generatorOptions });
        await this.composeWithJHipster('jhipster:javascript:husky', { generatorOptions });
        await this.composeWithJHipster('jhipster:javascript:eslint', { generatorOptions });
      },
    });
  }

  get [BaseSimpleApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanup({ control }) {
        if (control.isJhipsterVersionLessThan('7.5.1')) {
          this.removeFile('.lintstagedrc.js');
        }
      },
      async writeFiles({ application }) {
        await this.writeFiles({ sections: files, context: application });
      },
      async writeReadme({ application }) {
        if (this.generateReadme) {
          await this.writeFiles({ sections: readme, context: application });
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
