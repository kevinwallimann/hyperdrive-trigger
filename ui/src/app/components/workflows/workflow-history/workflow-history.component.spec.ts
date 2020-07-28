import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowHistoryComponent } from './workflow-history.component';
import {provideMockStore} from "@ngrx/store/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {FormsModule} from "@angular/forms";
import { HistoryModelFactory } from "../../../models/historyModel";

describe('WorkflowHistoryComponent', () => {
  let underTest: WorkflowHistoryComponent;
  let fixture: ComponentFixture<WorkflowHistoryComponent>;

  const historyRecordOne = HistoryModelFactory.create(1, new Date(Date.now()), 'userName', {name: 'Create'});
  const historyRecordTwo = HistoryModelFactory.create(2, new Date(Date.now()), 'userName', {name: 'Update'});
  const historyRecordThree = HistoryModelFactory.create(3, new Date(Date.now()), 'userName', {name: 'Delete'});

  const initialAppState = {
    workflows: {
      history: {
        loading: true,
        workflowHistory: [historyRecordOne, historyRecordTwo]
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: initialAppState })
      ],
      declarations: [WorkflowHistoryComponent],
      imports: [RouterTestingModule.withRoutes([]), FormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowHistoryComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should set properties during on init', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.loading).toBe(initialAppState.workflows.history.loading);
      expect(underTest.workflowHistory).toBe(initialAppState.workflows.history.workflowHistory);
    });
  }));

  it('isSelectable() should return false when 2 history records are selected', async(() => {
    underTest.workflowHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
    underTest.selected = [historyRecordOne, historyRecordTwo];

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.isSelectable(historyRecordThree)).toBeFalsy();
    });
  }));

  it('isSelectable() should return true when 0 history records are selected', async(() => {
    underTest.workflowHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
    underTest.selected = [];

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.isSelectable(historyRecordThree)).toBeTruthy();
    });
  }));


  it('isSelectable() should return true when 2 history records are selected and on input is already selected record', async(() => {
    underTest.workflowHistory = [historyRecordOne, historyRecordTwo, historyRecordThree];
    underTest.selected = [historyRecordOne, historyRecordTwo];

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(underTest.isSelectable(historyRecordOne)).toBeTruthy();
    });
  }));
});
