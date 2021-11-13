import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PencilSpinnerComponent } from './pencil-spinner.component';

describe('PencilSpinnerComponent', () => {
  let component: PencilSpinnerComponent;
  let fixture: ComponentFixture<PencilSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PencilSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PencilSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
