trigger PRD_Product2Trigger on Product2 (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    PRD_BaseService_111.ServiceConfig config =
        new PRD_BaseService_111.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            PRD_Domain_118 domain =
                new PRD_Domain_118();
            PRD_Domain_118.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (PRD_Domain_118.ValidationError err : validation.errors) {
                    if (err.severity == PRD_Domain_118.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        PRD_RecordService_113 service =
            new PRD_RecordService_113();
        PRD_BaseService_111.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'PRD trigger error: ' + error);
            }
        }
    }
}
