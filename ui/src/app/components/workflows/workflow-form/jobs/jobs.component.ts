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

import { AfterViewChecked, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { Subscription } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { Store } from '@ngrx/store';
import { FormPart, WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import { WorkflowAddEmptyJob, WorkflowRemoveJob } from '../../../../stores/workflows/workflows.actions';
import { JobEntryModel } from '../../../../models/jobEntry.model';
import { WorkflowEntryModel } from '../../../../models/workflowEntry.model';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnDestroy, OnInit, AfterViewChecked {
  @Input() jobsUnfold: EventEmitter<any>;
  @Input() mode: string;
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() jobsData: JobEntryModel[];

  workflowModes = workflowModes;

  hiddenJobs: Set<string>;

  jobsUnfoldSubscription: Subscription;

  constructor(private store: Store<AppState>) {
    this.hiddenJobs = new Set();
  }

  ngOnInit(): void {
    this.jobsUnfoldSubscription = this.jobsUnfold.subscribe((event) => {
      this.hiddenJobs.clear();
    });
  }

  ngAfterViewChecked(): void {
    if (this.jobsData.length == 0) {
      this.store.dispatch(new WorkflowAddEmptyJob(0));
    }
  }

  trackByFn(index, item: JobEntryModel) {
    return item.jobId;
  }

  toggleJob(jobId: string): void {
    if (this.hiddenJobs.has(jobId)) {
      this.hiddenJobs.delete(jobId);
    } else {
      this.hiddenJobs.add(jobId);
    }
  }

  isJobHidden(jobId: string): boolean {
    return this.hiddenJobs.has(jobId);
  }

  addJob() {
    this.store.dispatch(new WorkflowAddEmptyJob(this.jobsData.length));
  }

  removeJob(jobId: string): void {
    this.store.dispatch(new WorkflowRemoveJob(jobId));
  }

  getJobName(jobId: string) {
    const jobDataOption = this.jobsData.find((job) => job.jobId === jobId);
    const jobData = !!jobDataOption ? jobDataOption.entries : [];

    const nameOption = jobData.find((value) => value.property === this.workflowFormParts.staticJobPart.property);
    return !!nameOption ? nameOption.value : '';
  }

  ngOnDestroy(): void {
    !!this.jobsUnfoldSubscription && this.jobsUnfoldSubscription.unsubscribe();
  }
}
