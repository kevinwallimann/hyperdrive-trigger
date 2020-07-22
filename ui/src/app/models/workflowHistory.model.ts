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

import { SensorModel } from './sensor.model';
import { DagDefinitionJoinedModel } from './dagDefinitionJoined.model';
import { WorkflowJoinedModel } from './workflowJoined.model';

export type WorkflowHistoryModel = {
  id: number;
  changedOn: Date;
  changedBy: string;
  operation: OperationType;
  workflowId: number;
};

export type OperationType = {
  name: string;
};

export class WorkflowHistoryModelFactory {
  static create(
    id: number,
    changedOn: Date,
    changedBy: string,
    operation: OperationType,
    workflowId: number,
  ): WorkflowHistoryModel {
    return {
      id: id,
      changedOn: changedOn,
      changedBy: changedBy,
      operation: operation,
      workflowId: workflowId,
    };
  }
}

export type WorkflowHistForComparisonModel = {
  left: WorkflowJoinedModel;
  right: WorkflowJoinedModel;
};

export class WorkflowHistForComparisonModelFactory {
  static create(
      left: WorkflowJoinedModel,
      right: WorkflowJoinedModel
  ): WorkflowHistForComparisonModel {
    return {
      left: left,
      right: right
    };
  }
}
