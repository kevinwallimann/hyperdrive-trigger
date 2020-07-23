import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../../stores/app.reducers';
import { ActivatedRoute } from '@angular/router';
import { LoadWorkflowsHistForComparison } from '../../../../stores/workflows/workflows.actions';
import { workflowModes } from '../../../../models/enums/workflowModes.constants';
import { WorkflowEntryModel } from '../../../../models/workflowEntry.model';
import { DynamicFormPart, FormPart, WorkflowFormPartsModel } from '../../../../models/workflowFormParts.model';
import { JobEntryModel } from '../../../../models/jobEntry.model';

@Component({
  selector: 'app-workflow-comparison',
  templateUrl: './workflow-comparison.component.html',
  styleUrls: ['./workflow-comparison.component.scss'],
})
export class WorkflowComparisonComponent implements OnInit {
  workflowsSubscription: Subscription = null;
  paramsSubscription: Subscription;

  workflowModes = workflowModes;

  workflowDataLeft: {
    details: WorkflowEntryModel[];
    sensor: WorkflowEntryModel[];
    jobs: JobEntryModel[];
  };
  workflowDataRight: {
    details: WorkflowEntryModel[];
    sensor: WorkflowEntryModel[];
    jobs: JobEntryModel[];
  };
  workflowFormParts: WorkflowFormPartsModel;

  loading = true;

  constructor(private store: Store<AppState>, route: ActivatedRoute) {
    this.paramsSubscription = route.params.subscribe((parameters) => {
      console.log(parameters);
      // this.id = parameters.id;
      this.store.dispatch(new LoadWorkflowsHistForComparison({ left: parameters.historyIdLeft, right: parameters.historyIdRight }));
    });
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflowFormParts = state.workflowFormParts;
      this.workflowDataLeft = {
        details: state.historyData.left.detailsData,
        sensor: state.historyData.left.sensorData,
        jobs: state.historyData.left.jobsData,
      };
      this.workflowDataRight = {
        details: state.historyData.right.detailsData,
        sensor: state.historyData.right.sensorData,
        jobs: state.historyData.right.jobsData,
      };
      this.loading = state.loading;
    });
  }
}
