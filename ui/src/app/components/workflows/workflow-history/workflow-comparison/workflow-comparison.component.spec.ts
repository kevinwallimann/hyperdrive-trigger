import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowComparisonComponent } from './workflow-comparison.component';
import { DynamicFormPartsFactory, WorkflowFormPartsModelFactory } from '../../../../models/workflowFormParts.model';
import { workflowFormParts, workflowFormPartsSequences } from '../../../../constants/workflowFormParts.constants';
import { provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('WorkflowComparisonComponent', () => {
  let underTest: WorkflowComparisonComponent;
  let fixture: ComponentFixture<WorkflowComparisonComponent>;

  const initialAppState = {
    workflows: {
      history: {
        loading: true,
        workflowFormParts: WorkflowFormPartsModelFactory.create(
          workflowFormPartsSequences.allDetails,
          workflowFormParts.SENSOR.SENSOR_TYPE,
          workflowFormParts.JOB.JOB_NAME,
          workflowFormParts.JOB.JOB_TYPE,
          DynamicFormPartsFactory.create([], []),
        ),
        leftWorkflowHistoryData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
        rightWorkflowHistoryData: {
          details: [{ property: 'detailProp', value: 'detailVal' }],
          sensor: [{ property: 'sensorProp', value: 'sensorVal' }],
          jobs: [{ jobId: 'jobId', order: 0, entries: [{ property: 'jobProp', value: 'jobVal' }] }],
        },
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: initialAppState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              leftWorkflowHistoryId: '0',
              rightWorkflowHistoryId: '1',
            }),
          },
        },
      ],
      declarations: [WorkflowComparisonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComparisonComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should set properties during on init', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loading).toBe(initialAppState.workflows.history.loading);
      expect(underTest.workflowFormParts).toBe(initialAppState.workflows.history.workflowFormParts);
      expect(underTest.workflowDataLeft).toBe(initialAppState.workflows.history.leftWorkflowHistoryData);
      expect(underTest.workflowDataRight).toBe(initialAppState.workflows.history.rightWorkflowHistoryData);
    });
  }));
});
