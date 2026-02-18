trigger NAV_CaseTrigger on Case (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    NAV_BaseService_381.ServiceConfig config =
        new NAV_BaseService_381.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            NAV_Domain_388 domain =
                new NAV_Domain_388();
            NAV_Domain_388.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (NAV_Domain_388.ValidationError err : validation.errors) {
                    if (err.severity == NAV_Domain_388.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        NAV_RecordService_383 service =
            new NAV_RecordService_383();
        NAV_BaseService_381.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'NAV trigger error: ' + error);
            }
        }
    }
}
