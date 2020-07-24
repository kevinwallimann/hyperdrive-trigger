import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
export class WorkflowComparisonComponent implements OnInit, OnDestroy {
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
      this.store.dispatch(new LoadWorkflowsHistForComparison({ left: parameters.historyIdLeft, right: parameters.historyIdRight }));
    });
  }

  ngOnInit(): void {
    this.workflowsSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.workflowFormParts = state.history.workflowFormParts;
      this.workflowDataLeft = state.history.leftWorkflowHistoryData;
      this.workflowDataRight = state.history.rightWorkflowHistoryData;
      this.loading = state.history.loading;
    });
  }

  ngOnDestroy(): void {
    !!this.workflowsSubscription && this.workflowsSubscription.unsubscribe();
  }
}
