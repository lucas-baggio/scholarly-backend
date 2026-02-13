import { Injectable } from '@nestjs/common';
import { AllocationRepository } from '../../../domain/allocation/allocation.repository';
import { Allocation } from '../../../domain/allocation/allocation.entity';

@Injectable()
export class ListAllocationsByTeacherUseCase {
  constructor(private readonly allocationRepository: AllocationRepository) {}

  async execute(teacherId: string): Promise<Allocation[]> {
    return this.allocationRepository.findByTeacherId(teacherId);
  }
}
