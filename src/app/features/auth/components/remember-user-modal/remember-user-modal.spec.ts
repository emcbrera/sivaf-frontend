import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RememberUserModal } from './remember-user-modal';

describe('RememberUserModal', () => {
  let component: RememberUserModal;
  let fixture: ComponentFixture<RememberUserModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RememberUserModal],
    }).compileComponents();

    fixture = TestBed.createComponent(RememberUserModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
