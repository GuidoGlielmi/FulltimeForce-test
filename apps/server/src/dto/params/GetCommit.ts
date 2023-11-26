import { IsNotEmpty } from 'class-validator';

export class GetCommitParamsDTO {
  @IsNotEmpty({ message: 'Repositorio inválido' })
  public repoName: string;
}
