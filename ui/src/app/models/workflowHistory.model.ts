/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {SensorModel} from './sensor.model';
import {DagDefinitionJoinedModel} from './dagDefinitionJoined.model';
import {WorkflowJoinedModel} from "./workflowJoined.model";

export type WorkflowHistoryModel = {
  changedOn: Date;
  changedBy: string;
  operation: OperationType;
  workflowId: number;
  workflow: WorkflowJoinedModel;
};

export type OperationType = {
  name: string;
};

export class WorkflowHistoryModelFactory {
  static create(
    changedOn: Date,
    changedBy: string,
    operation: OperationType,
    workflowId: number,
    workflow: WorkflowJoinedModel
  ): WorkflowHistoryModel {
    return {
      changedOn: changedOn,
      changedBy: changedBy,
      operation: operation,
      workflowId: workflowId,
      workflow: workflow
    };
  }
}
