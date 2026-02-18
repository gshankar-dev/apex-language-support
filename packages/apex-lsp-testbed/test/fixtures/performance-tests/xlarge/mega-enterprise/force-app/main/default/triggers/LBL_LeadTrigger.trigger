trigger LBL_LeadTrigger on Lead (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    LBL_BaseService_881.ServiceConfig config =
        new LBL_BaseService_881.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            LBL_Domain_888 domain =
                new LBL_Domain_888();
            LBL_Domain_888.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (LBL_Domain_888.ValidationError err : validation.errors) {
                    if (err.severity == LBL_Domain_888.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        LBL_RecordService_883 service =
            new LBL_RecordService_883();
        LBL_BaseService_881.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'LBL trigger error: ' + error);
            }
        }
    }
}
