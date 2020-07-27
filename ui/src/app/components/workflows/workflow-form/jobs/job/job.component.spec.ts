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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobComponent } from './job.component';
import { provideMockStore } from '@ngrx/store/testing';
import {
  DynamicFormPart,
  DynamicFormPartFactory,
  DynamicFormPartsFactory, FormPart,
  FormPartFactory,
  PartValidationFactory,
  WorkflowFormPartsModelFactory,
} from '../../../../../models/workflowFormParts.model';
import {JobEntryModel, JobEntryModelFactory} from '../../../../../models/jobEntry.model';
import {WorkflowEntryModel, WorkflowEntryModelFactory} from '../../../../../models/workflowEntry.model';
import {Subject} from "rxjs";
import {Action} from "@ngrx/store";

describe('JobComponent', () => {
  let fixture: ComponentFixture<JobComponent>;
  let underTest: JobComponent;

  const jobStaticPart: FormPart = FormPartFactory.create('jobStaticPart', 'jobStaticPart', 'jobStaticPart', PartValidationFactory.create(true));
  const jobSwitchPart: FormPart = FormPartFactory.create('switchPartName', 'switchPartProp', 'switchPartType', PartValidationFactory.create(true), [
    'optionOne',
    'optionTwo',
  ]);
  const jobDynamicPartOne: DynamicFormPart = DynamicFormPartFactory.create('optionOne', [
    FormPartFactory.create('partOne', 'partOne', 'partOne', PartValidationFactory.create(true)),
  ]);
  const jobDynamicPartTwo: DynamicFormPart = DynamicFormPartFactory.create('optionTwo', [
    FormPartFactory.create('partTwo', 'partTwo', 'partTwo', PartValidationFactory.create(true)),
  ])
  const workflowFormParts =  WorkflowFormPartsModelFactory.create([], undefined,
      jobStaticPart,
      jobSwitchPart,
    DynamicFormPartsFactory.create([], [ jobDynamicPartOne, jobDynamicPartTwo ]),
  );
  const jobsData = [
    JobEntryModelFactory.createWithUuid(0, [
      WorkflowEntryModelFactory.create('jobStaticPart', 'value'),
      WorkflowEntryModelFactory.create('switchPartProp', 'value')
    ])
  ];
  const mode = 'mode';
  const jobId: string = jobsData[0].jobId;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JobComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobComponent);
    underTest = fixture.componentInstance;

    underTest.workflowFormParts = workflowFormParts;
    underTest.mode = mode;
    underTest.jobId = jobId;
    underTest.jobsData = jobsData;
    underTest.changes = new Subject<Action>();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('getJobTypes() should return job types', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const result = underTest.getJobTypes();
      expect(result).toEqual(workflowFormParts.jobSwitchPart.options);
    });
  }));

  // it('getSelectedJobComponent() should return first dynamic parts when no job is selected', async(() => {
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     const resultLeft = underTest.getSelectedJobComponent();
  //     const resultRight = workflowFormParts.dynamicParts.jobDynamicParts[0].parts;
  //
  //     expect(resultLeft).toEqual(resultRight);
  //   });
  // }));
  //
  // it('getSelectedJobComponent() should return dynamic parts when sensor is selected', async(() => {
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     underTest.selectedJob = initialAppState.workflows.workflowFormParts.dynamicParts.jobDynamicParts[1].name;
  //     const resultLeft = underTest.getSelectedJobComponent();
  //     const resultRight = initialAppState.workflows.workflowFormParts.dynamicParts.jobDynamicParts[1].parts;
  //
  //     expect(resultLeft).toEqual(resultRight);
  //   });
  // }));
  //

  it('getJobData() should return return job data', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const result = underTest.getJobData();

      expect(result).toEqual(jobsData[0].entries);
    });
  }));

  it('getJobData() should return empty array when job data does not exist for job with defined id', async(() => {
    underTest.jobId = '999';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const result = underTest.getJobData();

      expect(result).toEqual([]);
    });
  }));

  // it('getSelectedJob() should bla', async(() => {
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     const result = underTest.getSelectedJob();
  //
  //     expect(result).toEqual([]);
  //   });
  // }));

  it('getValue() should return value when property exists', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const queriedDetail = jobsData[0].entries[0];
      expect(underTest.getValue(queriedDetail.property)).toBe(queriedDetail.value);
    });
  }));

  it('getValue() should return undefined when property does not exist', async(() => {
    const undefinedProperty = 'undefinedProperty';

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.getValue(undefinedProperty)).toBe(undefined);
    });
  }));
});
