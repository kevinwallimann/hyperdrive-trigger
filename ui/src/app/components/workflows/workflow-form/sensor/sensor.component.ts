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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { WorkflowSensorChanged, WorkflowSensorTypeSwitched } from '../../../../stores/workflows/workflows.actions';
import { DynamicFormPart, FormPart, WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../models/workflowEntry.model';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit, OnDestroy {
  @Input() mode: string;
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() sensorData: WorkflowEntryModel[];
  workflowModes = workflowModes;

  sensorChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  sensorChangesSubscription: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.sensorChangesSubscription = this.sensorChanges.pipe(delay(0)).subscribe((sensorChange) => {
      if (sensorChange.property == this.workflowFormParts.sensorSwitchPart.property) {
        this.store.dispatch(new WorkflowSensorTypeSwitched(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
      } else {
        this.store.dispatch(new WorkflowSensorChanged(WorkflowEntryModelFactory.create(sensorChange.property, sensorChange.value)));
      }
    });
  }

  getSensorTypes(): string[] {
    return this.workflowFormParts.dynamicParts.sensorDynamicParts.map((component) => component.name);
  }

  getSelectedSensorComponent(): FormPart[] {
    const selected = this.sensorData.find((value) => value.property == this.workflowFormParts.sensorSwitchPart.property);
    const selectedSensor = !!selected ? selected.value : undefined;

    const sensorComponent = this.workflowFormParts.dynamicParts.sensorDynamicParts.find((sp) => sp.name == selectedSensor);
    return sensorComponent ? sensorComponent.parts : this.workflowFormParts.dynamicParts.sensorDynamicParts[0].parts;
  }

  getValue(prop: string) {
    const val = this.sensorData.find((value) => value.property == prop);
    return !!val ? val.value : undefined;
  }

  ngOnDestroy(): void {
    !!this.sensorChangesSubscription && this.sensorChangesSubscription.unsubscribe();
  }
}