trigger WFL_CaseTrigger on Case (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    WFL_BaseService_211.ServiceConfig config =
        new WFL_BaseService_211.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            WFL_Domain_218 domain =
                new WFL_Domain_218();
            WFL_Domain_218.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (WFL_Domain_218.ValidationError err : validation.errors) {
                    if (err.severity == WFL_Domain_218.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        WFL_RecordService_213 service =
            new WFL_RecordService_213();
        WFL_BaseService_211.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'WFL trigger error: ' + error);
            }
        }
    }
}
