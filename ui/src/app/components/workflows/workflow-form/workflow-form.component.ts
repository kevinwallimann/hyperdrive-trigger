import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {WorkflowEntryModel} from "../../../models/workflowEntry.model";
import {JobEntryModel} from "../../../models/jobEntry.model";
import {WorkflowFormPartsModel} from "../../../models/workflowFormParts.model";
import { workflowModes } from 'src/app/models/enums/workflowModes.constants';
import { absoluteRoutes } from 'src/app/constants/routes.constants';
import {ConfirmationDialogTypes} from "../../../constants/confirmationDialogTypes.constants";
import {texts} from "../../../constants/texts.constants";
import {
  CreateWorkflow,
  DeleteWorkflow, RemoveBackendValidationError,
  RunWorkflow,
  SwitchWorkflowActiveState, UpdateWorkflow
} from "../../../stores/workflows/workflows.actions";
import {Store} from "@ngrx/store";
import {AppState} from "../../../stores/app.reducers";
import {Subscription} from "rxjs";
import {ConfirmationDialogService} from "../../../services/confirmation-dialog/confirmation-dialog.service";
import {PreviousRouteService} from "../../../services/previousRoute/previous-route.service";
import {Router} from "@angular/router";
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-workflow-form',
  templateUrl: './workflow-form.component.html',
  styleUrls: ['./workflow-form.component.scss']
})
export class WorkflowFormComponent implements OnInit, OnDestroy {
  @ViewChild('workflowForm') workflowForm;
  @Output() jobsUnfold: EventEmitter<any> = new EventEmitter();
  @Input() workflowData: {
    details: WorkflowEntryModel[];
    sensor: WorkflowEntryModel[];
    jobs: JobEntryModel[];
  }
  @Input() workflowFormParts: WorkflowFormPartsModel;
  @Input() id: number;
  @Input() mode: string;
  @Input() backendValidationErrors: string[];

  workflowModes = workflowModes;
  absoluteRoutes = absoluteRoutes;

  isDetailsAccordionHidden = false;
  isSensorAccordionHidden = false;
  isJobsAccordionHidden = false;

  paramsSubscription: Subscription;
  workflowSubscription: Subscription;
  confirmationDialogServiceSubscription: Subscription = null;
  runWorkflowDialogSubscription: Subscription = null;

  isWorkflowActive: boolean = true;

  constructor(
    private store: Store<AppState>,
    private confirmationDialogService: ConfirmationDialogService,
    private previousRouteService: PreviousRouteService,
    private router: Router,
  ) {}

  ngOnInit(): void { }

  toggleDetailsAccordion() {
    this.isDetailsAccordionHidden = !this.isDetailsAccordionHidden;
  }

  toggleSensorAccordion() {
    this.isSensorAccordionHidden = !this.isSensorAccordionHidden;
  }

  toggleJobsAccordion() {
    this.isJobsAccordionHidden = !this.isJobsAccordionHidden;
  }

  showHiddenParts() {
    this.isDetailsAccordionHidden = false;
    this.isSensorAccordionHidden = false;
    this.isJobsAccordionHidden = false;
    this.jobsUnfold.emit();
  }

  getJobsData(): JobEntryModel[] {
    return cloneDeep(this.workflowData.jobs).sort((first, second) => first.order - second.order);
  }

  switchWorkflowActiveState(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(
        ConfirmationDialogTypes.YesOrNo,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_TITLE,
        texts.SWITCH_WORKFLOW_ACTIVE_STATE_CONTENT(this.isWorkflowActive),
      )
      .subscribe((confirmed) => {
        if (confirmed)
          this.store.dispatch(
            new SwitchWorkflowActiveState({
              id: id,
              currentActiveState: this.isWorkflowActive,
            }),
          );
      });
  }

  runWorkflow(id: number) {
    this.runWorkflowDialogSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.YesOrNo, texts.RUN_WORKFLOW_CONFIRMATION_TITLE, texts.RUN_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new RunWorkflow(id));
      });
  }

  deleteWorkflow(id: number) {
    this.confirmationDialogServiceSubscription = this.confirmationDialogService
      .confirm(ConfirmationDialogTypes.Delete, texts.DELETE_WORKFLOW_CONFIRMATION_TITLE, texts.DELETE_WORKFLOW_CONFIRMATION_CONTENT)
      .subscribe((confirmed) => {
        if (confirmed) this.store.dispatch(new DeleteWorkflow(id));
      });
  }

  createWorkflow() {
    if (this.workflowForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(ConfirmationDialogTypes.YesOrNo, texts.CREATE_WORKFLOW_CONFIRMATION_TITLE, texts.CREATE_WORKFLOW_CONFIRMATION_CONTENT)
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new CreateWorkflow());
        });
    } else {
      this.showHiddenParts();
    }
  }

  updateWorkflow() {
    if (this.workflowForm.form.valid) {
      this.confirmationDialogServiceSubscription = this.confirmationDialogService
        .confirm(ConfirmationDialogTypes.YesOrNo, texts.UPDATE_WORKFLOW_CONFIRMATION_TITLE, texts.UPDATE_WORKFLOW_CONFIRMATION_CONTENT)
        .subscribe((confirmed) => {
          if (confirmed) this.store.dispatch(new UpdateWorkflow());
        });
    } else {
      this.showHiddenParts();
    }
  }

  cancelWorkflow() {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    const currentUrl = this.previousRouteService.getCurrentUrl();

    !previousUrl || previousUrl === currentUrl
      ? this.router.navigateByUrl(absoluteRoutes.WORKFLOWS_HOME)
      : this.router.navigateByUrl(previousUrl);
  }

  removeBackendValidationError(index: number) {
    this.store.dispatch(new RemoveBackendValidationError(index));
  }

  ngOnDestroy(): void {
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
    !!this.paramsSubscription && this.paramsSubscription.unsubscribe();
    !!this.confirmationDialogServiceSubscription && this.confirmationDialogServiceSubscription.unsubscribe();
    !!this.runWorkflowDialogSubscription && this.runWorkflowDialogSubscription.unsubscribe();
  }

}
